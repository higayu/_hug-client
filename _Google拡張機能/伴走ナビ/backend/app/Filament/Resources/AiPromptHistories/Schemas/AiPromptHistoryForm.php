<?php

namespace App\Filament\Resources\AiPromptHistories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AiPromptHistoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('prompt_id')
                    ->relationship('prompt', 'feature_key')
                    ->searchable()
                    ->preload()
                    ->required(),
                Textarea::make('content')
                    ->required()
                    ->columnSpanFull(),
                Select::make('created_by')
                    ->relationship('createdByUser', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
            ]);
    }
}
