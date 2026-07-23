<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_pats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('ketersediaan_pompa', ['sudah_ada', 'belum'])->nullable();
            $table->enum('jenis_pompa', ['permukaan', 'submersible'])->nullable();
            $table->decimal('kapasitas_pompa_watt', 10, 2)->nullable();
            $table->enum('sumber_air', ['air_tanah', 'sungai', 'mata_air', 'lainnya'])->nullable();
            $table->string('sumber_air_lainnya')->nullable();
            $table->enum('izin_pemanfaatan_air', ['ada', 'belum_ada'])->nullable();
            $table->enum('ketersediaan_lahan_kontrol', ['ada', 'tidak'])->nullable();
            $table->string('status_kepemilikan_lahan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_pats');
    }
};
