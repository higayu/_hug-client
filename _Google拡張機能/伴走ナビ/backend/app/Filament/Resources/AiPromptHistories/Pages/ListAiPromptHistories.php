<?php

namespace App\Filament\Resources\AiPromptHistories\Pages;

use App\Filament\Resources\AiPromptHistories\AiPromptHistoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAiPromptHistories extends ListRecords
{
    protected static string $resource = AiPromptHistoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
