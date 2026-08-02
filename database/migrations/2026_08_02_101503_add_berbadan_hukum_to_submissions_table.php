<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (! Schema::hasColumn('submissions', 'berbadan_hukum')) {
                $table->boolean('berbadan_hukum')->default(false)->after('entry_type');
            }
        });

        // Existing "pengajuan" entries are potensi for legal entities.
        DB::table('submissions')
            ->where('entry_type', 'pengajuan')
            ->update([
                'entry_type' => 'potensi',
                'berbadan_hukum' => true,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('submissions')
            ->where('entry_type', 'potensi')
            ->where('berbadan_hukum', true)
            ->update([
                'entry_type' => 'pengajuan',
            ]);

        Schema::table('submissions', function (Blueprint $table) {
            if (Schema::hasColumn('submissions', 'berbadan_hukum')) {
                $table->dropColumn('berbadan_hukum');
            }
        });
    }
};
