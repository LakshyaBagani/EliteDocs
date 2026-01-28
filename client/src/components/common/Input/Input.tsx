import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <div className={`flex items-center bg-bg-secondary border rounded-lg transition-all 
        ${error ? 'border-error' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
                {icon && (
                    <span className="pl-3 text-text-muted flex items-center">
                        {icon}
                    </span>
                )}
                <input
                    className="flex-1 px-3 py-3 bg-transparent border-none text-text-primary text-base outline-none placeholder:text-text-muted"
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-error">{error}</span>
            )}
        </div>
    );
};
