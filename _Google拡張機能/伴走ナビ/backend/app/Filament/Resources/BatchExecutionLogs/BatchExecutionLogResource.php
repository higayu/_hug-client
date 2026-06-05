<?php

namespace App\Filament\Resources\BatchExecutionLogs;

use App\Filament\Resources\BatchExecutionLogs\Pages\CreateBatchExecutionLog;
use App\Filament\Resources\BatchExecutionLogs\Pages\EditBatchExecutionLog;
use App\Filament\Resources\BatchExecutionLogs\Pages\ListBatchExecutionLogs;
use App\Filament\Resources\BatchExecutionLogs\Pages\ViewBatchExecutionLog;
use App\Filament\Resources\BatchExecutionLogs\Schemas\BatchExecutionLogForm;
use App\Filament\Resources\BatchExecutionLogs\Schemas\BatchExecutionLogInfolist;
use App\Filament\Resources\BatchExecutionLogs\Tables\BatchExecutionLogsTable;
use App\Models\BatchExecutionLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class BatchExecutionLogResource extends Resource
{
    protected static ?string $model = BatchExecutionLog::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return BatchExecutionLogForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return BatchExecutionLogInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BatchExecutionLogsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListBatchExecutionLogs::route('/'),
            'create' => CreateBatchExecutionLog::route('/create'),
            'view' => ViewBatchExecutionLog::route('/{record}'),
            'edit' => EditBatchExecutionLog::route('/{record}/edit'),
        ];
    }
}
