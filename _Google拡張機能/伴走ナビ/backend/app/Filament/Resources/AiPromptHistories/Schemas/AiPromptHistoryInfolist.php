<?php

namespace App\Filament\Resources\AiPromptHistories\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AiPromptHistoryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('prompt.prompt_id')
                    ->label('Prompt'),
                TextEntry::make('content')
                    ->columnSpanFull(),
                TextEntry::make('created_by')
                    ->numeric(),
                TextEntry::make('created_at')
                    ->dateTime(),
            ]);
    }
}
