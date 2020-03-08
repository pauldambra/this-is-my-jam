




# Confusing things about serverless

Resources has to be inside resources 

```yaml
resources:
  Resources:
    TootsTable:
      Type: "AWS::DynamoDB::Table"
```

but there's no error if, like me, you don' t notice that and have top level Resources