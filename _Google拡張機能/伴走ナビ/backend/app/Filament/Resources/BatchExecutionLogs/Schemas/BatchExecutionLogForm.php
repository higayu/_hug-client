<?php

namespace App\Filament\Resources\BatchExecutionLogs\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BatchExecutionLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('job_name')
                    ->required()
                    ->maxLength(100),
                TextInput::make('status')
                    ->required()
                    ->maxLength(50),
                DateTimePicker::make('started_at')
                    ->required(),
                DateTimePicker::make('finished_at'),
                Textarea::make('error_message')
                    ->columnSpanFull(),
            ]);
    }
}
