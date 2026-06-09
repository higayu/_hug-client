<?php

namespace App\Filament\Resources\SupportRecords\Tables;

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
                ->orderByDesc('target_date')
                ->orderBy('child_id')
            )
            ->columns([
                TextColumn::make('target_date')
                    ->label('対象日')
                    ->date('Y-m-d')
                    ->sortable(),

                TextColumn::make('child_id')
                    ->label('児童ID')
                    ->numeric()
                    ->sortable()
                    ->searchable(),

                TextColumn::make('user.name')
                    ->label('記録者')
                    ->placeholder('-')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('content')
                    ->label('内容')
                    ->limit(60)
                    ->wrap()
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
                //
            ]);
    }
}
