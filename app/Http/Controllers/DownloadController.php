<?php

namespace App\Http\Controllers;

use App\Models\Download;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadController extends Controller
{
    public function download(Download $download): BinaryFileResponse|Response
    {
        if (! $download->is_active) {
            abort(404);
        }

        $path = Storage::disk('public')->path($download->file_path);

        if (! file_exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->download($path, $download->original_name);
    }
}
