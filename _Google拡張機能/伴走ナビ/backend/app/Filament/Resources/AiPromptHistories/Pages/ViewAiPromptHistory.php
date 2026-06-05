<?php

namespace App\Filament\Resources\AiPromptHistories\Pages;

use App\Filament\Resources\AiPromptHistories\AiPromptHistoryResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAiPromptHistory extends ViewRecord
{
    protected static string $resource = AiPromptHistoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
