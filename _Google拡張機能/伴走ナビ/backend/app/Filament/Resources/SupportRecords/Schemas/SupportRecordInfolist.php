<?php

namespace App\Filament\Resources\SupportRecords\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class SupportRecordInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('child_id')
                    ->numeric(),
                TextEntry::make('user.name')
                    ->label('User'),
                TextEntry::make('content')
                    ->columnSpanFull(),
                TextEntry::make('target_date')
                    ->date(),
                TextEntry::make('created_at')
                    ->dateTime(),
                TextEntry::make('updated_at')
                    ->dateTime(),
            ]);
    }
}
