<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class UserInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user_id')
                    ->label('ユーザーID')
                    ->numeric(),

                TextEntry::make('name')
                    ->label('氏名'),

                TextEntry::make('login_id')
                    ->label('ログインID')
                    ->placeholder('-'),

                TextEntry::make('email')
                    ->label('メールアドレス')
                    ->placeholder('-'),

                TextEntry::make('email_verified_at')
                    ->label('メール確認日時')
                    ->dateTime()
                    ->placeholder('-'),

                TextEntry::make('role')
                    ->label('権限'),

                TextEntry::make('created_at')
                    ->label('作成日時')
                    ->dateTime(),

                TextEntry::make('updated_at')
                    ->label('更新日時')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
