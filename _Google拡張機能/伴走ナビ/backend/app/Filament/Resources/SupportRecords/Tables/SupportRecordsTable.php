<?php

namespace App\Filament\Resources\SupportRecords\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SupportRecordsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query
                ->orderBy('child_id')
                ->orderByDesc('target_date')
            )
            ->columns([
                TextColumn::make('child_id')
                    ->label('児童ID')
                    ->numeric()
                    ->sortable()
                    ->searchable(),

                TextColumn::make('target_date')
                    ->label('対象日')
                    ->date('Y-m-d')
                    ->sortable(),

                TextColumn::make('user.name')
                    ->label('記録者')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('content')
                    ->label('内容')
                    ->limit(60)
                    ->searchable(),

                TextColumn::make('created_at')
                    ->label('作成日時')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('更新日時')
                    ->dateTime('Y-m-d H:i')
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
