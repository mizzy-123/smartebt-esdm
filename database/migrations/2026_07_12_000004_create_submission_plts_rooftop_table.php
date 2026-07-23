<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_plts_rooftop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('kapasitas_kwh_eksisting', 10, 2)->nullable();
            $table->text('kondisi_lokasi')->nullable();
            $table->decimal('panjang_instalasi', 10, 2)->nullable();
            $table->enum('jenis_bangunan', ['permanen', 'sementara'])->nullable();
            $table->string('jenis_gedung')->nullable();
            $table->string('umur_bangunan')->nullable();
            $table->decimal('luas_bangunan', 10, 2)->nullable();
            $table->decimal('tinggi_bangunan', 10, 2)->nullable();
            $table->enum('jenis_atap', ['baja_ringan', 'kayu', 'kanal_c', 'kanal_i', 'beton', 'lainnya'])->nullable();
            $table->string('jenis_atap_lainnya')->nullable();
            $table->integer('tahun_pemasangan_atap')->nullable();
            $table->decimal('luas_atap', 10, 2)->nullable();
            $table->text('potensi_bayangan')->nullable();
            $table->string('nomor_pelanggan')->nullable();
            $table->enum('jenis_layanan_listrik', ['pascabayar', 'prabayar'])->nullable();
            $table->text('data_pelanggan')->nullable();
            $table->decimal('daya_terpasang_pln', 10, 2)->nullable();
            $table->decimal('perkiraan_kapasitas_plts', 10, 2)->nullable();
            $table->integer('jumlah_pengguna')->nullable();
            $table->boolean('kesediaan_ganti_meteran')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_plts_rooftop');
    }
};
