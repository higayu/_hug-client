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
                TextInput::make('email')
                    ->label('メールアドレス')
                    ->email()
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
            'email' => $data['email'],
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
            'data.email' => 'メールアドレスまたはパスワードが正しくありません。',
        ]);
    }
}
