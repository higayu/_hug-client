<?php

namespace App\Filament\Resources\AiPrompts\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AiPromptForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('feature_key')
                    ->required()
                    ->maxLength(100),
                Textarea::make('content')
                    ->required()
                    ->columnSpanFull(),
                Select::make('updated_by')
                    ->relationship('updatedByUser', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
            ]);
    }
}
