# DEV GUIDELINES

## BACKEND
1. Input validálni (zod használatával).
   Szigorúan validálni kell a query paramétereket, a request body-t, és a route paramétereket. 
2. Ha kötelező a route-hoz, akkor validálni kell a felhasználó engedélyeit. 
   (Pl: Be van-e jelentkezve, benne van a kurzusban, ő-e a tanár, stb..)
3. Error handling mindig legyen
4. Egy route ugyanolyan típusú adatokat adjon vissza.
   (Pl: Ha 1 elemet ad vissza, akkor szigorúan 1 elemet adjon vissza, ha többet, akkor minden esetben listát adjon vissza)

## FRONTEND