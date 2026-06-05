<?php

namespace App\Filament\Resources\AiPromptHistories;

use App\Filament\Resources\AiPromptHistories\Pages\CreateAiPromptHistory;
use App\Filament\Resources\AiPromptHistories\Pages\EditAiPromptHistory;
use App\Filament\Resources\AiPromptHistories\Pages\ListAiPromptHistories;
use App\Filament\Resources\AiPromptHistories\Pages\ViewAiPromptHistory;
use App\Filament\Resources\AiPromptHistories\Schemas\AiPromptHistoryForm;
use App\Filament\Resources\AiPromptHistories\Schemas\AiPromptHistoryInfolist;
use App\Filament\Resources\AiPromptHistories\Tables\AiPromptHistoriesTable;
use App\Models\AiPromptHistory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AiPromptHistoryResource extends Resource
{
    protected static ?string $model = AiPromptHistory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return AiPromptHistoryForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AiPromptHistoryInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AiPromptHistoriesTable::configure($table);
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
            'index' => ListAiPromptHistories::route('/'),
            'create' => CreateAiPromptHistory::route('/create'),
            'view' => ViewAiPromptHistory::route('/{record}'),
            'edit' => EditAiPromptHistory::route('/{record}/edit'),
        ];
    }
}
