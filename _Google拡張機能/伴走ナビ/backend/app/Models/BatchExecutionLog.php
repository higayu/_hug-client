<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['job_name', 'status', 'started_at', 'finished_at', 'error_message'])]
class BatchExecutionLog extends Model
{
    protected $primaryKey = 'log_id';

    protected $table = 'batch_execution_logs';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}
