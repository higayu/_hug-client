<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user_id')
                    ->label('ユーザーID')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('name')
                    ->label('氏名')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('login_id')
                    ->label('ログインID')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email')
                    ->label('メールアドレス')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('role')
                    ->label('権限')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email_verified_at')
                    ->label('メール確認日時')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('作成日時')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('更新日時')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
