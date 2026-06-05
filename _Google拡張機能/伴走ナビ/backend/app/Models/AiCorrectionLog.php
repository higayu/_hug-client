<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'history_id', 'additional_prompt', 'original_text', 'result_text'])]
class AiCorrectionLog extends Model
{
    protected $primaryKey = 'log_id';

    protected $table = 'ai_correction_logs';

    public $timestamps = true;

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function history(): BelongsTo
    {
        return $this->belongsTo(AiPromptHistory::class, 'history_id', 'history_id');
    }
}
