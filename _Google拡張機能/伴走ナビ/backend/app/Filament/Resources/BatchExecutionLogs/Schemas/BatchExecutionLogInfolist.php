<?php

namespace App\Filament\Resources\BatchExecutionLogs\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class BatchExecutionLogInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('job_name'),
                TextEntry::make('status'),
                TextEntry::make('started_at')
                    ->dateTime(),
                TextEntry::make('finished_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('error_message')
                    ->placeholder('-')
                    ->columnSpanFull(),
            ]);
    }
}
