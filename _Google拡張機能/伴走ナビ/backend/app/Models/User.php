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
    'login_id',
    'hug_password',
    'email',
    'email_verified_at',
    'password',
    'remember_token',
    'role',
])]
#[Hidden([
    'password',
    'hug_password',
    'remember_token',
])]
class User extends Authenticatable implements FilamentUser, JWTSubject
{
    protected $table = 'users';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (empty($user->user_id)) {
                $user->user_id = (int) (static::max('user_id') ?? 0) + 1;
            }

            if (empty($user->role)) {
                $user->role = 'staff';
            }
        });
    }

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'facility_id' => 'integer',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getJWTIdentifier(): mixed
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
