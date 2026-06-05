<?php

namespace App\Filament\Resources\SupportRecords\Pages;

use App\Filament\Resources\SupportRecords\SupportRecordResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSupportRecords extends ListRecords
{
    protected static string $resource = SupportRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
