<?php

namespace App\Filament\Auth;

use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Validation\ValidationException;
use SensitiveParameter;

class CustomLogin extends BaseLogin
{
    public function getHeading(): string
    {
        return '';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('login_id')
                    ->label('ログインID')
                    ->required()
                    ->autofocus(),

                TextInput::make('password')
                    ->label('パスワード')
                    ->password()
                    ->required()
                    ->revealable(),
            ]);
    }

    protected function getCredentialsFromFormData(#[SensitiveParameter] array $data): array
    {
        return [
            'login_id' => $data['login_id'],
            'password' => $data['password'],
        ];
    }

    public function authenticate(): ?LoginResponse
    {
        $this->dispatch('loading');

        try {
            return parent::authenticate();
        } finally {
            $this->dispatch('loading-finished');
        }
    }

    protected function throwFailureValidationException(): never
    {
        throw ValidationException::withMessages([
            'data.login_id' => 'ログインIDまたはパスワードが正しくありません。',
        ]);
    }
}
