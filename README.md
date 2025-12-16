# Filc

A filc egy oktatási rendszer és e-napló.

## Linkek

- Github: https://github.com/kardos-zoltan/filc
- Trello: https://trello.com/b/337W1zwT/filc

## Tagok

- Kardos Zoltán
- Döme Zoltán

## Futtatás

### Felállítás

Kötelező programok:
- node: >=v22.18.0
- npm: >=11.6.2
- MySQL: >=10.4.32-MariaDB (ha lehet akkor XAMPP >=v3.3.0-n keresztül)

Futtassa ezt a parancsot a projekt mappájában hogy letelepítse a kötelező csomagokat.
```sh
npm install
```

Majd csináljon egy `filc` nevű adatbázist MySQL-n belül, 
`utf8mb4_unicode_520_ci` illesztéssel, majd töltse a `db/filc.sql` nevű fájlt.

### Futtatás (fejlesztés)

Indítsa el az adatbázis szervert, majd futtassa a következő parancsot hogy
elindítsa a fejlesztési szervert.
```sh
npm run dev
```