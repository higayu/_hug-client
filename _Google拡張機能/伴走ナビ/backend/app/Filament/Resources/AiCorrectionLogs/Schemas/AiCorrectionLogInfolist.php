<?php

namespace App\Filament\Resources\AiCorrectionLogs\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AiCorrectionLogInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user.name')
                    ->label('User'),
                TextEntry::make('history.history_id')
                    ->label('History'),
                TextEntry::make('additional_prompt')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('original_text')
                    ->columnSpanFull(),
                TextEntry::make('result_text')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->dateTime(),
            ]);
    }
}
