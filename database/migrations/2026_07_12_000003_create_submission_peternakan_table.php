<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_peternakan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('jenis_teknologi', ['digester_biogas', 'plts', 'bsg', 'pats']);
            $table->decimal('kapasitas_kandang_m2', 10, 2)->nullable();
            $table->string('jenis_ternak')->nullable();
            $table->string('jenis_usaha')->nullable();
            $table->integer('jumlah_ternak')->nullable();
            $table->text('ketersediaan_lahan')->nullable();
            $table->text('komitmen_pengelolaan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_peternakan');
    }
};
