<?php

namespace App\Filament\Resources\AiCorrectionLogs\Pages;

use App\Filament\Resources\AiCorrectionLogs\AiCorrectionLogResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAiCorrectionLogs extends ListRecords
{
    protected static string $resource = AiCorrectionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
