## Simple voting API

## Common Response

```json=
{
    "msg": String,
    "code": 1 success; 0 error,
    "data": Response data,
    "status": "success" or "error"
}
```

## GET (All)

| Item   | Value      |
| ------ | ---------- |
| Method | GET        |
| path   | **/votes** |
| param  |            |

![](https://i.imgur.com/vNDUJDj.jpg)

## GET (One)

| Item   | Value         |
| ------ | ------------- |
| Method | GET           |
| path   | **/vote/:id** |
| param  | required      |

![](https://i.imgur.com/4Q6ENwC.jpg)

## POST

| Item   | Value     |
| ------ | --------- |
| Method | POST      |
| path   | **/vote** |
| param  | optional  |

```json=
{
    "title": "Do you agree everyone should have the right to drink soda?"
}
```

![](https://i.imgur.com/z5a8N2b.jpg)

## PATCH

| Item   | Value     |
| ------ | --------- |
| Method | PATCH     |
| path   | **/vote** |
| param  | required  |

```json=
{
    "id":"ab1UunUVvHTVcGGEoe1Br", // vote id => required
    "title: "Hi everyone", // modify the tile => optional
    "option" : "win" // either "win", "lose", "draw" => required
}
```

![](https://i.imgur.com/G5v5SqY.jpg)

## DELETE

| Item   | Value         |
| ------ | ------------- |
| Method | DELETE        |
| path   | **/vote/:id** |
| param  | required      |

- You can list vote ids in the whitelist in **db.json** if you want to prevent certain ids from being deleted.
  ![](https://i.imgur.com/tf4cAVs.jpg)

## Whitelist

![](https://i.imgur.com/YHK1GYS.jpg)
