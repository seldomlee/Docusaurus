---
id: Java面向对象
title: Java面向对象
---



java是面向对象的编程语言，面向对象程序设计具有可重用性、可扩展性、可管理性的优点





## 三大特性

1. 封装
2. 继承
3. 多态

## 类和对象

在面向对象中，类和对象是最基本、最重要的组成单元：



- 类是描述了一组有相同特性（属性）和相同行为（方法）的一组对象的集合

- 类是对象的抽象，对象是类的具体。
  类是概念模型，定义对象的所有特性和所需的操作，对象是真实的模型，是一个具体的实体。

- 对象/实例拥有的**特征**，在类中表示为**类的属性**

  对象**执行的操作**称为**类的方法**


  打个比方说学生这个**类**，具有学号、班级、姓名等等的**属性**，拥有运动、学习、吃饭、休息的**方法**。

  那么将其实例化，具体到某个对象就是：

  某个学生，他的属性是：姓名=王小明，班级=3年二班，学号=10001；他的方法是运动、学习、吃饭、休息...



## 类的定义

```java
[public][abstract|final]class<class_name>[extends<class_name>][implements<interface_name>] {
    // 定义属性部分
    <property_type><property1>;
    <property_type><property2>;
    <property_type><property3>;
    …
    // 定义方法部分
    function1();
    function2();
    function3();
    …
}
```

- `public`：表示“共有”的意思。如果使用 public 修饰，则可以被其他类和程序访问。每个 Java 程序的主类都必须是 public 类，作为公共工具供其他类和程序使用的类应定义为 public 类。
- `abstract`：如果类被 abstract 修饰，则该类为抽象类，抽象类不能被实例化，但抽象类中可以有抽象方法（使用 abstract 修饰的方法）和具体方法（没有使用 abstract 修饰的方法）。继承该抽象类的所有子类都必须实现该抽象类中的所有抽象方法（除非子类也是抽象类）。
- `final`：如果类被 final 修饰，则不允许被继承。
- `class`：声明类的关键字。
- `class_name`：类的名称。
- `extends`：表示继承其他类。
- `implements`：表示实现某些接口。
- `property_type`：表示成员变量的类型。
- `property`：表示成员变量名称。
- `function()`：表示成员方法名称。

### java类名命名规则

- 应以下划线或字母开头，建议使用驼峰法；
- 不能为Java中的关键字
- 不能包含任何嵌入的空格或点号以及除了下划线（_）和美元符号（$）字符之外的特殊字符

### 类的属性

```java
[public|protected|private][static][final]<type><variable_name>
```

- public、protected、private：用于表示成员变量的访问权限。
- static：表示该成员变量为类变量，也称为静态变量。
- final：表示将该成员变量声明为常量，其值无法更改。
- type：表示变量的类型。
- variable_name：表示变量名称。
