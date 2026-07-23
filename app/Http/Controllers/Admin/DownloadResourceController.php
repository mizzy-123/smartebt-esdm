<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Download;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DownloadResourceController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('admin');

        $downloads = Download::orderBy('sort_order')->orderBy('title')->get();

        return Inertia::render('admin/downloads/index', [
            'downloads' => $downloads,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('admin');

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file'        => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx', 'max:10240'],
            'sort_order'  => ['nullable', 'integer'],
        ]);

        $file = $request->file('file');
        $path = $file->store('downloads', 'public');

        Download::create([
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getMimeType(),
            'sort_order'    => $data['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'File unduhan berhasil ditambahkan.');
    }

    public function update(Request $request, Download $download): RedirectResponse
    {
        Gate::authorize('admin');

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file'        => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx', 'max:10240'],
            'sort_order'  => ['nullable', 'integer'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('file')) {
            // Delete old file
            Storage::disk('public')->delete($download->file_path);
            $file = $request->file('file');
            $download->file_path     = $file->store('downloads', 'public');
            $download->original_name = $file->getClientOriginalName();
            $download->mime_type     = $file->getMimeType();
        }

        $download->title       = $data['title'];
        $download->description = $data['description'] ?? null;
        $download->sort_order  = $data['sort_order'] ?? $download->sort_order;
        $download->is_active   = $data['is_active'] ?? $download->is_active;
        $download->save();

        return back()->with('success', 'File unduhan berhasil diperbarui.');
    }

    public function destroy(Download $download): RedirectResponse
    {
        Gate::authorize('admin');

        Storage::disk('public')->delete($download->file_path);
        $download->delete();

        return back()->with('success', 'File unduhan berhasil dihapus.');
    }
}
