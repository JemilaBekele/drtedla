// utils/emailValidator.ts

export interface EmailValidationResult {
    valid: boolean;
    message: string;
}

// Comprehensive list of disposable email domains
const disposableDomains = [
    'mailinator.com',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    '10minutemail.com',
    '10minutemail.net',
    '10minutemail.org',
    'tempmail.com',
    'tempmail.net',
    'tempmail.org',
    'temp-mail.org',
    'temp-mail.com',
    'temp-mail.net',
    'yopmail.com',
    'yopmail.fr',
    'yopmail.net',
    'throwawaymail.com',
    'throwawaymail.net',
    'throwawaymail.org',
    'spamgourmet.com',
    'spamgourmet.net',
    'spamgourmet.org',
    'spambox.com',
    'spambox.net',
    'spambox.org',
    'mailnator.com',
    'mailnator.net',
    'mailnator.org',
    'trashmail.com',
    'trashmail.net',
    'trashmail.org',
    'trash2009.com',
    'trash2009.net',
    'trash2009.org',
    'trashymail.com',
    'trashymail.net',
    'trashymail.org',
    'spamdecoy.net',
    'spamdecoy.org',
    'spamex.com',
    'spamex.net',
    'spamex.org',
    'mailsac.com',
    'mailsac.net',
    'mailsac.org',
    'fakeinbox.com',
    'fakeinbox.net',
    'fakeinbox.org',
    'getnada.com',
    'getnada.net',
    'getnada.org',
    'maildrop.cc',
    'maildrop.net',
    'maildrop.org',
    'guerrillamail.info',
    'tempmail.info',
    'temp-mail.info',
    'discard.email',
    'discardmail.com',
    'discardmail.net',
    'discardmail.org',
    'mailmetrash.com',
    'mailmetrash.net',
    'mailmetrash.org',
    'moakt.com',
    'moakt.net',
    'moakt.org',
    'mohmal.com',
    'mohmal.net',
    'mohmal.org',
    'guerrillamail.de',
    'guerrillamail.fr',
    'guerrillamail.it',
    'guerrillamail.es',
    'guerrillamail.pt',
    'guerrillamail.nl',
    'guerrillamail.se',
    'guerrillamail.no',
    'guerrillamail.dk',
    'guerrillamail.fi',
    'guerrillamail.pl',
    'guerrillamail.cz',
    'guerrillamail.hu',
    'guerrillamail.sk',
    'guerrillamail.ro',
    'guerrillamail.bg',
    'guerrillamail.gr',
    'guerrillamail.lt',
    'guerrillamail.lv',
    'guerrillamail.ee',
    'sharklasers.com',
    'grr.la',
    'gettemporaryemail.com',
    '24hour.email',
    'dispostable.com',
    'emailfake.com',
    'emailgenerator.com',
    'emailondeck.com',
    'fake-email.cc',
    'fake-mail.net',
    'fakemailgenerator.com',
    'gmailnator.com',
    'mail-temp.com',
    'mail-temp.net',
    'mail-temp.org',
    'mailslurp.com',
    'mailtemp.net',
    'mytrashmail.com',
    'mytrashmail.net',
    'mytrashmail.org',
    'nada.ltd',
    'nospam.xyz',
    'oneoffemail.com',
    'oneoffmail.com',
    'poofy.org',
    'quickemail.info',
    'quickmail.nl',
    'safe-mail.cc',
    'sendspamhere.com',
    'spam.la',
    'spam.team',
    'spamthisplease.com',
    'stopmyemail.com',
    'supergreatmail.com',
    'thismail.net',
    'trash.net',
    'trash2009.com',
    'trash2009.net',
    'trash2009.org',
    'trashemail.de',
    'trashmail.me',
    'trashmail.ws',
    'trashmailer.com',
    'tyldd.com',
    'webemail.me',
    'wegwerfmail.net',
    'wegwerfmail.org',
    'wegwerpmail.net',
    'wegwerpmail.org',
    'wh4f.org',
    'whyspam.me',
    'willselfdestruct.com',
    'winemaven.info',
    'wronghead.com',
    'wuzup.net',
    'xagloo.com',
    'xemaps.com',
    'xents.com',
    'xmaily.com',
    'xoxy.net',
    'yep.it',
    'yogamaven.com',
    'yopmail.fr',
    'yopmail.net',
    'ypmail.webarnak.fr.eu.org',
    'yuurok.com',
    'zehnminutenmail.de',
    'zippymail.info',
    'zoaxe.com',
    'zoemail.org',
    'zombie-hive.com',
    'zumpul.com'
];

/**
 * Extract domain from email address
 */
const extractDomain = (email: string): string | null => {
    if (!email) return null;
    const parts = email.toLowerCase().split('@');
    return parts.length === 2 ? parts[1] : null;
};

/**
 * Check if email uses a disposable domain
 */
const isDisposableEmail = (email: string): boolean => {
    if (!email) return false;
    const domain = extractDomain(email);
    if (!domain) return false;
    return disposableDomains.includes(domain);
};

/**
 * Validate email format using regex
 */
export const isValidEmailFormat = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

/**
 * Comprehensive email validation including disposable domain check
 */
export const validateEmail = (email: string): EmailValidationResult => {
    // Check if email exists
    if (!email) {
        return {
            valid: false,
            message: 'Email is required'
        };
    }

    // Trim email
    const trimmedEmail = email.trim();

    // Check email format
    if (!isValidEmailFormat(trimmedEmail)) {
        return {
            valid: false,
            message: 'Invalid email format'
        };
    }

    // Check if it's a disposable email
    if (isDisposableEmail(trimmedEmail)) {
        return {
            valid: false,
            message: 'Disposable email addresses are not allowed. Please use a permanent email address.'
        };
    }

    return {
        valid: true,
        message: 'Valid email'
    };
};