<?php

namespace App\Filament\Resources\AiPromptHistories\Pages;

use App\Filament\Resources\AiPromptHistories\AiPromptHistoryResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditAiPromptHistory extends EditRecord
{
    protected static string $resource = AiPromptHistoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
