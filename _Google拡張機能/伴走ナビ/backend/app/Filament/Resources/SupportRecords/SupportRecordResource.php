<?php

namespace App\Filament\Resources\SupportRecords;

use App\Filament\Resources\SupportRecords\Pages\CreateSupportRecord;
use App\Filament\Resources\SupportRecords\Pages\EditSupportRecord;
use App\Filament\Resources\SupportRecords\Pages\ListSupportRecords;
use App\Filament\Resources\SupportRecords\Pages\ViewSupportRecord;
use App\Filament\Resources\SupportRecords\Schemas\SupportRecordForm;
use App\Filament\Resources\SupportRecords\Schemas\SupportRecordInfolist;
use App\Filament\Resources\SupportRecords\Tables\SupportRecordsTable;
use App\Models\SupportRecord;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SupportRecordResource extends Resource
{
    protected static ?string $model = SupportRecord::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return SupportRecordForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return SupportRecordInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SupportRecordsTable::configure($table);
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
            'index' => ListSupportRecords::route('/'),
            'create' => CreateSupportRecord::route('/create'),
            'view' => ViewSupportRecord::route('/{record}'),
            'edit' => EditSupportRecord::route('/{record}/edit'),
        ];
    }
}
