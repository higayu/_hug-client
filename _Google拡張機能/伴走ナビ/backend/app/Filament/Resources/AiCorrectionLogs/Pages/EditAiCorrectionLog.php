<?php

namespace App\Filament\Resources\AiCorrectionLogs\Pages;

use App\Filament\Resources\AiCorrectionLogs\AiCorrectionLogResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditAiCorrectionLog extends EditRecord
{
    protected static string $resource = AiCorrectionLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
