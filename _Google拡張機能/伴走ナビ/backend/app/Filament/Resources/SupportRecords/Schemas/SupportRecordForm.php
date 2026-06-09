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
                    ->label('児童ID')
                    ->required()
                    ->numeric()
                    ->disabledOn('edit'),

                DatePicker::make('target_date')
                    ->label('対象日')
                    ->required()
                    ->native(false)
                    ->displayFormat('Y-m-d')
                    ->disabledOn('edit'),

                Select::make('user_id')
                    ->label('記録者')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Textarea::make('content')
                    ->label('内容')
                    ->required()
                    ->rows(8)
                    ->columnSpanFull(),
            ]);
    }
}
