<?php

namespace App\Filament\Resources\AiCorrectionLogs\Pages;

use App\Filament\Resources\AiCorrectionLogs\AiCorrectionLogResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAiCorrectionLog extends ViewRecord
{
    protected static string $resource = AiCorrectionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
