<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

#[Fillable([
    'user_id',
    'facility_id',
    'name',
    'email',
    'password',
    'login_id',
    'hug_password',
    'role',
])]
#[Hidden(['password', 'hug_password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, JWTSubject
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (empty($user->user_id)) {
                $user->user_id = (int) (static::max('user_id') ?? 0) + 1;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'user_id' => $this->user_id,
            'facility_id' => $this->facility_id,
            'role' => $this->role,
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'facility_id', 'facility_id');
    }

    public function supportRecords(): HasMany
    {
        return $this->hasMany(SupportRecord::class, 'user_id', 'user_id');
    }

    public function aiCorrectionLogs(): HasMany
    {
        return $this->hasMany(AiCorrectionLog::class, 'user_id', 'user_id');
    }

    public function updatedAiPrompts(): HasMany
    {
        return $this->hasMany(AiPrompt::class, 'updated_by', 'user_id');
    }

    public function aiPromptHistories(): HasMany
    {
        return $this->hasMany(AiPromptHistory::class, 'created_by', 'user_id');
    }
}
