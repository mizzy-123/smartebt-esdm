<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['peternakan_ebt', 'plts_rooftop', 'plts_perikanan', 'pats']);
            $table->enum('status', ['belum_intervensi', 'sudah_intervensi'])->default('belum_intervensi');
            $table->string('nama_pemohon');
            $table->string('nomor_identitas');
            $table->text('alamat_organisasi');
            $table->string('nama_ketua');
            $table->string('surat_permohonan_proposal_path')->nullable();
            $table->string('dokumen_kepengurusan_path')->nullable();
            $table->string('dokumen_sk_kemenkumham_path')->nullable();
            $table->string('surat_keterangan_desa_path')->nullable();
            $table->boolean('kesediaan_ganti_kwh_pascabayar')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('deskripsi_titik')->nullable();
            $table->json('field_reviews')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
