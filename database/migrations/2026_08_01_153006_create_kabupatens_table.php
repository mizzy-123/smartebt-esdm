<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kabupaten', function (Blueprint $table) {
            $table->id('kabupaten_id');
            $table->foreignId('provinsi_id')->constrained('provinsi','provinsi_id')->onDelete('cascade');
            $table->string('nama');
            $table->foreignId('wilayah_id')->constrained('wilayah','wilayah_id')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kabupaten');
    }
};