<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['prompt_id', 'content', 'created_by'])]
class AiPromptHistory extends Model
{
    protected $primaryKey = 'history_id';

    protected $table = 'ai_prompt_histories';

    public $timestamps = true;

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function prompt(): BelongsTo
    {
        return $this->belongsTo(AiPrompt::class, 'prompt_id', 'prompt_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function correctionLogs(): HasMany
    {
        return $this->hasMany(AiCorrectionLog::class, 'history_id', 'history_id');
    }
}
