<?php

namespace App\Models;

use App\Models\AiPromptHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['feature_key', 'content', 'updated_by'])]
class AiPrompt extends Model
{
    protected $primaryKey = 'prompt_id';

    protected $table = 'ai_prompts';

    public $timestamps = true;

    const CREATED_AT = null;

    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by', 'user_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AiPromptHistory::class, 'prompt_id', 'prompt_id');
    }
}
