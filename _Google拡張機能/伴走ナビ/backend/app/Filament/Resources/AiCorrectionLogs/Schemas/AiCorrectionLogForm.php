<?php

namespace App\Filament\Resources\AiCorrectionLogs\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AiCorrectionLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                Select::make('history_id')
                    ->relationship('history', 'history_id')
                    ->searchable()
                    ->preload()
                    ->required(),
                Textarea::make('additional_prompt')
                    ->columnSpanFull(),
                Textarea::make('original_text')
                    ->required()
                    ->columnSpanFull(),
                Textarea::make('result_text')
                    ->required()
                    ->columnSpanFull(),
            ]);
    }
}
