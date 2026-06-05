<?php

namespace App\Filament\Resources\BatchExecutionLogs\Pages;

use App\Filament\Resources\BatchExecutionLogs\BatchExecutionLogResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewBatchExecutionLog extends ViewRecord
{
    protected static string $resource = BatchExecutionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
