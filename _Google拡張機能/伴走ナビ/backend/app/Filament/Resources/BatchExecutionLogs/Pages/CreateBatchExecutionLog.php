<?php

namespace App\Filament\Resources\BatchExecutionLogs\Pages;

use App\Filament\Resources\BatchExecutionLogs\BatchExecutionLogResource;
use Filament\Resources\Pages\CreateRecord;

class CreateBatchExecutionLog extends CreateRecord
{
    protected static string $resource = BatchExecutionLogResource::class;
}
