<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'target_date',
    'child_id',
    'user_id',
    'content',
])]
class SupportRecord extends Model
{
    protected $table = 'support_records';

    /**
     * 実DB上の主キーは PRIMARY KEY (child_id, target_date)。
     * Eloquent / Filament は単一主キー前提なので、
     * id カラム参照を避けるため代表キーとして child_id を指定。
     */
    protected $primaryKey = 'child_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'target_date' => 'date:Y-m-d',
            'child_id' => 'integer',
            'user_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getRouteKey(): mixed
    {
        return $this->child_id . '_' . $this->target_date->format('Y-m-d');
    }

    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('child_id', $this->getOriginal('child_id', $this->child_id))
            ->where('target_date', $this->getOriginal('target_date', $this->target_date));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
