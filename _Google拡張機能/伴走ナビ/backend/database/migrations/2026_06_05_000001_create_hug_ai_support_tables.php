<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->increments('facility_id');
            $table->string('name', 255);
            $table->dateTime('created_at')->useCurrent();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->increments('user_id');
            $table->unsignedInteger('facility_id');
            $table->string('name', 255);
            $table->string('email', 255)->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255)->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->string('role', 50)->default('staff');
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->nullable();

            $table->index('facility_id');
            $table->index('role');
            $table->foreign('facility_id')->references('facility_id')->on('facilities')->cascadeOnUpdate();
        });

        Schema::create('support_records', function (Blueprint $table) {
            $table->increments('record_id');
            $table->integer('child_id');
            $table->unsignedInteger('user_id');
            $table->text('content');
            $table->date('target_date');
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('user_id');
            $table->index('target_date');
            $table->foreign('user_id')->references('user_id')->on('users')->cascadeOnUpdate();
        });

        Schema::create('ai_prompts', function (Blueprint $table) {
            $table->increments('prompt_id');
            $table->string('feature_key', 100)->unique();
            $table->text('content');
            $table->unsignedInteger('updated_by');
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('updated_by');
            $table->foreign('updated_by')->references('user_id')->on('users')->cascadeOnUpdate();
        });

        Schema::create('ai_prompt_histories', function (Blueprint $table) {
            $table->increments('history_id');
            $table->unsignedInteger('prompt_id');
            $table->text('content');
            $table->unsignedInteger('created_by');
            $table->dateTime('created_at')->useCurrent();

            $table->index('prompt_id');
            $table->index('created_by');
            $table->index('created_at');
            $table->foreign('created_by')->references('user_id')->on('users')->cascadeOnUpdate();
            $table->foreign('prompt_id')->references('prompt_id')->on('ai_prompts')->cascadeOnDelete()->cascadeOnUpdate();
        });

        Schema::create('ai_correction_logs', function (Blueprint $table) {
            $table->increments('log_id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('history_id');
            $table->text('additional_prompt')->nullable();
            $table->text('original_text');
            $table->text('result_text');
            $table->dateTime('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('history_id');
            $table->index('created_at');
            $table->foreign('history_id')->references('history_id')->on('ai_prompt_histories')->cascadeOnUpdate();
            $table->foreign('user_id')->references('user_id')->on('users')->cascadeOnUpdate();
        });

        Schema::create('batch_execution_logs', function (Blueprint $table) {
            $table->increments('log_id');
            $table->string('job_name', 100);
            $table->string('status', 50);
            $table->dateTime('started_at');
            $table->dateTime('finished_at')->nullable();
            $table->text('error_message')->nullable();

            $table->index('job_name');
            $table->index('status');
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_execution_logs');
        Schema::dropIfExists('ai_correction_logs');
        Schema::dropIfExists('ai_prompt_histories');
        Schema::dropIfExists('ai_prompts');
        Schema::dropIfExists('support_records');
        Schema::dropIfExists('users');
        Schema::dropIfExists('facilities');
    }
};
