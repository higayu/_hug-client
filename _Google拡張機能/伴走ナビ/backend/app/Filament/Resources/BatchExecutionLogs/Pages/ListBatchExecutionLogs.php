<?php

namespace App\Filament\Resources\BatchExecutionLogs\Pages;

use App\Filament\Resources\BatchExecutionLogs\BatchExecutionLogResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBatchExecutionLogs extends ListRecords
{
    protected static string $resource = BatchExecutionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
