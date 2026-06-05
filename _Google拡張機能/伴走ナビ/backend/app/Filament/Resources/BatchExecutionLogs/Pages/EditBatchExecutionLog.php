<?php

namespace App\Filament\Resources\BatchExecutionLogs\Pages;

use App\Filament\Resources\BatchExecutionLogs\BatchExecutionLogResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditBatchExecutionLog extends EditRecord
{
    protected static string $resource = BatchExecutionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
