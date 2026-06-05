<?php

namespace App\Filament\Resources\SupportRecords\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SupportRecordForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('child_id')
                    ->required()
                    ->numeric(),
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                Textarea::make('content')
                    ->required()
                    ->columnSpanFull(),
                DatePicker::make('target_date')
                    ->required(),
            ]);
    }
}
