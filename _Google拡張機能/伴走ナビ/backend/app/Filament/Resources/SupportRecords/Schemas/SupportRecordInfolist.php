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
                    ->label('児童ID')
                    ->numeric(),

                TextEntry::make('target_date')
                    ->label('対象日')
                    ->date('Y-m-d'),

                TextEntry::make('user.name')
                    ->label('記録者'),

                TextEntry::make('content')
                    ->label('内容')
                    ->columnSpanFull(),

                TextEntry::make('created_at')
                    ->label('作成日時')
                    ->dateTime('Y-m-d H:i'),

                TextEntry::make('updated_at')
                    ->label('更新日時')
                    ->dateTime('Y-m-d H:i'),
            ]);
    }
}
