<?php

namespace App\Filament\Resources\AiCorrectionLogs;

use App\Filament\Resources\AiCorrectionLogs\Pages\CreateAiCorrectionLog;
use App\Filament\Resources\AiCorrectionLogs\Pages\EditAiCorrectionLog;
use App\Filament\Resources\AiCorrectionLogs\Pages\ListAiCorrectionLogs;
use App\Filament\Resources\AiCorrectionLogs\Pages\ViewAiCorrectionLog;
use App\Filament\Resources\AiCorrectionLogs\Schemas\AiCorrectionLogForm;
use App\Filament\Resources\AiCorrectionLogs\Schemas\AiCorrectionLogInfolist;
use App\Filament\Resources\AiCorrectionLogs\Tables\AiCorrectionLogsTable;
use App\Models\AiCorrectionLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AiCorrectionLogResource extends Resource
{
    protected static ?string $model = AiCorrectionLog::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return AiCorrectionLogForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AiCorrectionLogInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AiCorrectionLogsTable::configure($table);
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
            'index' => ListAiCorrectionLogs::route('/'),
            'create' => CreateAiCorrectionLog::route('/create'),
            'view' => ViewAiCorrectionLog::route('/{record}'),
            'edit' => EditAiCorrectionLog::route('/{record}/edit'),
        ];
    }
}
