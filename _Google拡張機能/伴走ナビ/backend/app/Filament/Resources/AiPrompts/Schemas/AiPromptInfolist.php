<?php

namespace App\Filament\Resources\AiPrompts\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AiPromptInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('feature_key'),
                TextEntry::make('content')
                    ->columnSpanFull(),
                TextEntry::make('updated_by')
                    ->numeric(),
                TextEntry::make('updated_at')
                    ->dateTime(),
            ]);
    }
}
